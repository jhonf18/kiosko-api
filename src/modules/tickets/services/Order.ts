import { v4 as uuid4 } from 'uuid';
import { UserService } from './../../../shared/services/user';
import { ProductRepository } from './../../backOffice/repository/product';
import { ICreateOrderInput, ISelectedProductInput } from './../dto';
import { TicketRepository } from './../repository/ticket';

import moment from 'moment';
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
    if (!order.name)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'Debes ingresar el nombre de la orden.', true);

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
      name: order.name,
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
      'id,sections,comments,product.name,product.price,product.ingredients,product.id'
    );

    let response = JSON.parse(JSON.stringify(data));
    response.tickets = tickets;
    return response;
  }

  public async getOrders(filter: any, getData?: string) {
    getData = getData || '';
    const getDataArray = getData.split(',');
    getData = getDataArray.join(' ');

    // Find orders per days
    if (filter.today) {
      // Get date with format
      const today = moment(new Date(Number(filter.today)));
      // Add the search filter for tickets after a certain date
      filter.created_at = { $gte: today.utc() };
    }

    if (filter.sort_by) {
      const type = filter.sort_by.split('(')[0];
      const field = filter.sort_by.substring(filter.sort_by.indexOf('(') + 1, filter.sort_by.lastIndexOf(')'));
      filter.sort = {
        type,
        field
      };
      delete filter.sort_by;
    }

    let orders = (await this.orderRepo.find(filter, getData, true)) as any;

    orders = JSON.parse(JSON.stringify(orders));

    // TODO: Verificar el envio de datos con productos sin ingredientes como bebidas

    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      order.tickets = await this.ticketService.getTickets(
        { order: order._id },
        'id,sections,product,comments,product.name,product.id,product.ingredients,date_accepted,date_finished'
      );
      if (order.selected_products) {
        const selectedProducts = order.selected_products as any[];
        let selectedProductsReponse = [];

        // If exists products in order
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
          console.log(selectedProduct.product.selected_ingredients);
          selectedProductResponse.ticket_id = selectedProduct.ticket_id;

          selectedProductResponse.all_ingredients = selectedProduct.product.selected_ingredients.map(
            (ingredientObj: any) => {
              return {
                ...ingredientObj.ingredient,
                ...(ingredientObj.quantity && { quantity: ingredientObj.quantity })
              };
            }
          );
          selectedProductsReponse.push(selectedProductResponse);
          delete selectedProductResponse.selected_ingredients;
        }

        order.selected_products = selectedProductsReponse;
        delete order._id;
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

    if (!products || products.length === 0)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'Es necesario agregar productos.', true);

    const orderStore = await this.orderRepo.findOne({ id: orderID }, 'id is_open _id total_price branch_office');

    if (!orderStore)
      throw new ApiError('Not Found Order', httpStatus.NOT_FOUND, 'No se ha encontrado la orden a editar', true);

    if (!orderStore.is_open)
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'No es posible editar la orden debido a que ya está cerrada. Para poder editar es necesario que líder vuelva abrirla.',
        true
      );

    const result = (await this.orderRepo.update({ id: orderID }, { added_products: products }, orderStore)) as any;

    let ticketsIDS: any[] = result?.tickets.map((ticket: any) => ({ id: ticket.id }));

    const tickets = await this.ticketService.getTickets(
      { $or: ticketsIDS },
      'id,sections,comments,product.name,product.price,product.ingredients'
    );

    let response = JSON.parse(JSON.stringify(result));
    response.tickets = tickets;
    return response;
  }

  public async deleteProductToOrder(orderID: string, dataForDeleteProduct: { productID: string; comments: string }) {
    if (!orderID) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    if (!dataForDeleteProduct.productID || dataForDeleteProduct.productID.length < 1)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El ID del producto a elimiar no es válido.', true);

    if (!dataForDeleteProduct.comments || dataForDeleteProduct.comments.length < 1)
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'No se puede leer los comentarios (Son necesarios).',
        true
      );

    const ordersStorePromise = this.orderRepo.find(
      { id: orderID },
      'selected_products category id total_price _id is_open',
      true
    );
    const productStorePromise = this.productRepo.findOne(
      { id: dataForDeleteProduct.productID },
      'id passage_sections price'
    );

    const [ordersStore, productStore] = await Promise.all([ordersStorePromise, productStorePromise]);

    if (!ordersStore || ordersStore.length === 0)
      throw new ApiError('Not Found Order', httpStatus.NOT_FOUND, 'No se ha encontrado la orden solicitada.', true);

    const orderStore = ordersStore[0];

    if (!orderStore.is_open)
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'No es posible editar la orden debido a que ya está cerrada. Para poder editar es necesario que líder vuelva abrirla.',
        true
      );

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

    const indexOfProductInSelectedProductOfOrder = orderStore.selected_products.findIndex((el: any) => {
      const id = el.comments?.split('::')[0];
      return id === uuidOfProductInOrder;
    });

    if (indexOfProductInSelectedProductOfOrder < 0)
      throw new ApiError(
        'Not Found Product In Order',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el producto dentro de la orden.',
        true
      );

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
          return uuidOfProduct === uuidOfProductInOrder;
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

          const deleteCount = await this.ticketRepo.deleteMany({ _id: ticketForThisProduct._id });
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

    const ordersStorePromise = this.orderRepo.find({ id: orderID }, 'selected_products id _id is_open', true);

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

    if (!orderStore.is_open)
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'No es posible editar la orden debido a que ya está cerrada. Para poder editar es necesario que líder vuelva abrirla.',
        true
      );

    const uuidThisProduct = comments.split('::')[0];
    const comment = comments.split('::')[1];

    const newComment = `${uuidThisProduct}::${comment}`;

    const indexProductObj = orderStore.selected_products.findIndex(el => {
      const uuid = el.comments.split('::')[0];
      return uuid === uuidThisProduct;
    });

    if (indexProductObj < 0)
      throw new ApiError(
        'Not Found Product',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el producto asociado a la orden.',
        true
      );

    let ticketStore;
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
          return uuidOfProduct === uuidThisProduct;
        });

        // Delete this ticket in Db
        if (ticketForThisProduct) {
          // Verify that check that the preparation of the product has not started
          if (ticketForThisProduct.date_accepted)
            throw new ApiError(
              'Bad Request',
              httpStatus.BAD_REQUEST,
              'No ha sido posible editar el producto, debido a que ya se ha comenzado a preparar.',
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

          ticketStore = await this.ticketRepo.find(
            { _id: ticketForThisProduct._id },
            'id sections product comments product.name product.id product.ingredients'
          );
        }
      }
    }

    orderStore.selected_products[indexProductObj].comments = newComment;
    if (ingredients) {
      orderStore.selected_products[indexProductObj].ids_selected_ingredients = ingredients;
    }

    const result = await this.orderRepo.update(
      { id: orderID },
      { selected_products: orderStore.selected_products as any }
    );

    ticketStore = JSON.parse(JSON.stringify(ticketStore));

    // TODO: Refactor code
    if (ticketStore) {
      console.log(ticketStore[0]);
      for (const ticket of ticketStore) {
        // If the array of variants exists, only the one that was selected will be chosen to be sent to the client
        // If the customer selected some ingredients of the product or edited it and there are ingredients and get ingredients of products.
        let ingredientsResponse = [];
        if (
          ticket.product &&
          ticket.ingredients &&
          ticket.ingredients.length > 0 &&
          ticket.product.selected_ingredients &&
          ticket.product.selected_ingredients.length > 0
        ) {
          // We should select the ingredients of ticket.product.selected_ingredients array such that coincide with those of the ticket.ingredients
          for (const ingredientID of ticket.ingredients) {
            let ingredientResponse: any = {};
            const ingredient = ticket.product.selected_ingredients.find((el: any) => el.ingredient.id === ingredientID);
            Object.assign(ingredientResponse, ingredient.ingredient);
            if (ingredient.quantity) {
              ingredientResponse.quantity = ingredient.quantity;
            }
            ingredientsResponse.push(ingredientResponse);
          }
        }
        // -if the client select all ingredients of the product
        else if (
          ticket.product &&
          ticket.product.selected_ingredients &&
          ticket.product.selected_ingredients.length > 0
        ) {
          const ingredientsResponse = ticket.product.selected_ingredients.map((ingredient: any) => {
            let ingredientResponse: any = {};
            Object.assign(ingredientResponse, ingredient.ingredient);
            if (ingredient.quantity) {
              ingredientResponse.quantity = ingredient.quantity;
            }
            return ingredientResponse;
          });
          ingredientsResponse.push(...ingredientsResponse);
        }

        if (ingredientsResponse.length > 0) {
          ticket.product.ingredients = ingredientsResponse;
          ticket.has_ingredients = true;
        }

        if (ingredientsResponse.length === 0) {
          ticket.has_ingredients = false;
        }

        // We eliminate the fields that are not necessary for the client
        delete ticket.ingredients;
        delete ticket.product.selected_ingredients;

        if (ticket.order && ticket.order.waiter) {
          ticket.waiter = ticket.order.waiter;
          delete ticket.order.waiter;
        }
      }
      return { order: result, ticket: ticketStore[0] };
    } else {
      return { order: result };
    }
  }
}
