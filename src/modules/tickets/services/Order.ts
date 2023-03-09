import { v4 as uuid4 } from 'uuid';
import { UserService } from './../../../shared/services/user';
import { ProductRepository } from './../../backOffice/repository/product';
import { ICreateOrderInput, ISelectedProductInput } from './../dto';
import { TicketRepository } from './../repository/ticket';

import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { BranchOfficeRepository } from './../../backOffice/repository/branchOffice';
import { OrderRepository } from './../repository/order';
import { TicketService } from './Ticket';
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly productRepo: ProductRepository,
    private readonly branchOfficeRepo: BranchOfficeRepository,
    private readonly ticketService: TicketService,
    private readonly ticketRepo: TicketRepository,
    private readonly userService: UserService
  ) {}

  public async createOrder(order: ICreateOrderInput) {
    if (!order.totalPrice)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'Debes ingresar el precio total de la orden.', true);

    if (!order.selectedProducts || order.selectedProducts.length === 0)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se ha ingresado productos a la orden.', true);

    if (!order.branchOffice)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID de la sucursal.', true);

    // Find Branch Office
    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id: order.branchOffice }, 'id');
    if (!branchOfficeStore)
      throw new ApiError('Not Found Branch Office', httpStatus.NOT_FOUND, 'No se ha encontrado la sucursal.', true);

    if (!order.waiter)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID del mesero.', true);

    const waiterStore = await this.userService.findUserById(order.waiter, 'id role');
    if (!waiterStore || waiterStore.role !== 'ROLE_WAITER')
      throw new ApiError(
        'Not Found Waiter',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el mesero o no es un mesero.',
        true
      );

    // Create order
    const data = await this.orderRepo.saveOrderAndGenerateTickets({
      id: uuid4(),
      selected_products: order.selectedProducts,
      comments: order.comments,
      total_price: order.totalPrice,
      branch_office: order.branchOffice,
      is_open: order.isOpen,
      waiter: order.waiter
    });

    let ticketsIDS: any[] = data.tickets.map((ticket: any) => ({ id: ticket.id }));

    const tickets = await this.ticketService.getTickets(
      { $or: ticketsIDS },
      'id,sections,comments,product.name,product.price,product.ingredients'
    );

    let response = JSON.parse(JSON.stringify(data));
    response.tickets = tickets;
    return response;
  }

  public async getOrders(filter: Object, getData?: string) {
    getData = getData || '';
    const getDataArray = getData.split(',');
    getData = getDataArray.join(' ');

    let orders = (await this.orderRepo.find(filter, getData)) as any;

    orders = JSON.parse(JSON.stringify(orders));

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      if (order.selected_products) {
        const selectedProducts = order.selected_products as any[];
        let selectedProductsReponse = [];
        for (let selectedProduct of selectedProducts) {
          let selectedProductResponse: any = {};
          Object.assign(selectedProductResponse, selectedProduct.product);
          selectedProductResponse.comments = selectedProduct.comments || null;

          if (
            selectedProduct.ids_selected_ingredients &&
            selectedProduct.ids_selected_ingredients.length > 0 &&
            selectedProduct.product.selected_ingredients
          ) {
            selectedProductResponse.ingredients = [];

            for (const ingredientId of selectedProduct.ids_selected_ingredients) {
              const ingredient = selectedProduct.product.selected_ingredients.find(
                (ingredient: any) => ingredient.ingredient.id === ingredientId
              );
              if (ingredient) {
                let ingredientResponse: any = {};
                Object.assign(ingredientResponse, ingredient.ingredient);
                if (ingredient.quantity) {
                  ingredientResponse.quantity = ingredient.quantity;
                }
                selectedProductResponse.ingredients.push(ingredientResponse);
              }
            }
          } else if (selectedProduct.product.selected_ingredients) {
            selectedProductResponse.ingredients = [];
            const ingredientsResponse = selectedProduct.product.selected_ingredients.map((ingredient: any) => {
              let ingredientResponse: any = {};
              Object.assign(ingredientResponse, ingredient.ingredient);
              if (ingredient.quantity) {
                ingredientResponse.quantity = ingredient.quantity;
              }
              return ingredientResponse;
            });
            selectedProductResponse.ingredients.push(...ingredientsResponse);
          }

          // selectedProduct = selectedProductResponse;
          selectedProductsReponse.push(selectedProductResponse);
          delete selectedProductResponse.selected_ingredients;
          // delete selectedProduct.selected_ingredients;
        }

        order.selected_products = selectedProductsReponse;
      }
    }

    return orders;
  }

  public async deleteOrder(id: string) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    const result = await this.orderRepo.deleteOrdersWithAssociatedTickets({ id: id });

    if (!result || result === 0)
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se encontró la orden para eliminar', true);

    return true;
  }

  public async changeStatusOfOrder(id: string, status: boolean) {
    if (!id) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    if (typeof status !== 'boolean')
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'No se puede leer el estado de la orden para actualizar',
        true
      );

    const result = await this.orderRepo.update({ id }, { is_open: status });

    return { order: result };
  }

  public async addProductsToOrder(orderID: string, products: Array<ISelectedProductInput>) {
    if (!orderID) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    const result = await this.orderRepo.update({ id: orderID }, { added_products: products });

    return { order: result };
  }

  public async deleteProductToOrder(orderID: string, dataForDeleteProduct: { productID: string; comments: string }) {
    if (!orderID) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    if (!dataForDeleteProduct.productID || dataForDeleteProduct.productID.length < 1)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El ID del producto a elimiar no es válido.', true);

    const ordersStorePromise = this.orderRepo.find(
      { id: orderID },
      'selected_products selected_products.id category selected_products._id id total_price _id',
      true
    );
    const productStorePromise = this.productRepo.findOne(
      { id: dataForDeleteProduct.productID },
      'id passage_sections price'
    );

    const [ordersStore, productStore] = await Promise.all([ordersStorePromise, productStorePromise]);

    if (!ordersStore || ordersStore.length === 0)
      throw new ApiError('Not Found Order', httpStatus.NOT_FOUND, 'No se ha encontrado la orden solicitada.', true);

    const orderStore = ordersStore[0] as any;

    if (orderStore.selected_products.length === 1)
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'No es posible eliminar el producto, ya que la orden quedaría sin productos.',
        true
      );

    if (!productStore)
      throw new ApiError(
        'Not Found Product',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el producto a eliminar.',
        true
      );

    // We should delete the tickets of this order
    const uuidOfProductInOrder = dataForDeleteProduct.comments.split('::')[0];

    if (productStore.passage_sections.includes('COCINA') || productStore.passage_sections.includes('HORNO')) {
      const tickets = await this.ticketRepo.find(
        { product: productStore.id, order: orderStore._id },
        '_id id comments date_accepted',
        true
      );

      if (tickets && tickets.length > 0) {
        // Search ticket for this product
        const ticketForThisProduct = tickets.find(ticket => {
          const uuidOfProduct = ticket?.comments.split('::')[0];
          uuidOfProduct === uuidOfProductInOrder;
        });

        // Delete this ticket in Db
        if (ticketForThisProduct) {
          // Verify that check that the preparation of the product has not started
          if (ticketForThisProduct.date_accepted)
            throw new ApiError(
              'Bad Request',
              httpStatus.BAD_REQUEST,
              'No ha sido posible eliminar el producto, debido a que ya se ha comenzado a preparar el producto.',
              true
            );

          const deleteCount = await this.ticketRepo.deleteMany([{ _id: ticketForThisProduct._id }]);
          if (!deleteCount || deleteCount < 1) {
            throw new ApiError(
              'Internal Server Error',
              httpStatus.INTERNAL_SERVER_ERROR,
              'Ha ocurrido un error inesperado y no ha sido posible eliminar el ticket de la orden.',
              true
            );
          }
        }
      }
    }

    const indexOfProductInSelectedProductOfOrder = orderStore.selected_products.findIndex((el: any) => {
      const id = el.comments?.split('::')[0];
      return id === uuidOfProductInOrder;
    });

    if (!indexOfProductInSelectedProductOfOrder)
      throw new ApiError(
        'Not Found Product In Order',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el producto dentro de la orden.',
        true
      );

    orderStore.selected_products.splice(indexOfProductInSelectedProductOfOrder, 1);

    const productsOKForsave = orderStore.selected_products.map((el: any) => ({
      product: el.product._id,
      comments: el.comments,
      ids_selected_ingredients: el.ids_selected_ingredients
    }));

    const result = await this.orderRepo.update(
      { id: orderID },
      { selected_products: productsOKForsave, total_price: orderStore.total_price - productStore.price }
    );

    return { order: result };
  }

  public async updateCommentOrIngredientsToProductOfOrder(
    orderID: string,
    { comments, productID, ingredients }: { comments: string; productID: string; ingredients?: Array<string> }
  ) {
    if (!orderID) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    if (ingredients && ingredients.length === 0)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'Es necesario añadir los ingredientes', true);

    const productStorePromise = this.productRepo.findOne({ id: productID }, 'id passage_sections price');

    const ordersStorePromise = this.orderRepo.find({ id: orderID }, 'selected_products id _id', true);

    const [ordersStore, productStore] = await Promise.all([ordersStorePromise, productStorePromise]);

    if (!ordersStore || ordersStore.length === 0)
      throw new ApiError('Not Found Order', httpStatus.NOT_FOUND, 'No se ha encontrado la orden solicitada.', true);

    if (!productStore)
      throw new ApiError(
        'Not Found Product',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el producto a eliminar.',
        true
      );

    const orderStore = ordersStore[0];
    const uuidThisProduct = comments.split('::')[0];
    const comment = comments.split('::')[1];

    const newComment = `${uuidThisProduct}::${comment}`;

    if (productStore.passage_sections.includes('COCINA') || productStore.passage_sections.includes('HORNO')) {
      const tickets = await this.ticketRepo.find(
        { product: productStore.id, order: orderStore._id },
        '_id id comments date_accepted',
        true
      );

      if (tickets && tickets.length > 0) {
        // Search ticket for this product
        const ticketForThisProduct = tickets.find(ticket => {
          const uuidOfProduct = ticket?.comments.split('::')[0];
          uuidOfProduct === uuidThisProduct;
        });

        // Delete this ticket in Db
        if (ticketForThisProduct) {
          // Verify that check that the preparation of the product has not started
          if (ticketForThisProduct.date_accepted)
            throw new ApiError(
              'Bad Request',
              httpStatus.BAD_REQUEST,
              'No ha sido posible añadir el comentario, debido a que ya se ha comenzado a preparar el producto.',
              true
            );

          let objForUpdate: { comments: string; ingredients?: Array<string> } = {
            comments: newComment
          };

          if (ingredients) {
            objForUpdate.ingredients = ingredients;
          }

          const updatedTicket = await this.ticketRepo.updateOne({ _id: ticketForThisProduct._id }, objForUpdate);

          if (!updatedTicket)
            throw new ApiError(
              'Internal Error Server',
              httpStatus.INTERNAL_SERVER_ERROR,
              'Ha ocurrido un error inesperado al actualizar el ticket.',
              true
            );
        }
      }
    }

    const indexProductObj = orderStore.selected_products.findIndex(el => {
      const uuid = el.comments.split('::')[0];
      uuid === uuidThisProduct;
    });

    if (!indexProductObj)
      throw new ApiError(
        'Not Found Product',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el producto asociado a la orden.',
        true
      );

    orderStore.selected_products[indexProductObj].comments = newComment;
    if (ingredients) {
      orderStore.selected_products[indexProductObj].ids_selected_ingredients = ingredients;
    }

    const result = await this.orderRepo.update(
      { id: orderID },
      { selected_products: orderStore.selected_products as any }
    );

    return { order: result };
  }
}
