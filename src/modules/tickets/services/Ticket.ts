import moment from 'moment';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { TicketRepository } from './../repository/ticket';

interface IUpdateObject {
  date_accepted?: Date;
  date_finished?: Date;
  finished?: boolean;
}

export class TicketService {
  constructor(private readonly ticketRepo: TicketRepository) {}

  public async getTickets(filter: any, getData?: string) {
    // If the client does not send parameters to get data by default it will be just an empty string
    // Example of getData: getData = 'product,custom_product,order'
    getData = getData || '';
    let dataArray = getData.split(',');
    getData = dataArray.join(' ');

    // Find tickets per days
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

    // Find tickets in DB
    let tickets = (await this.ticketRepo.find(filter, getData)) as any;

    // Remove javascript object references to be able to add and remove properties to the response object
    tickets = JSON.parse(JSON.stringify(tickets));

    for (const ticket of tickets) {
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

    return tickets;
  }
  // TODO: Evit change status to accept when the ticket is finished or accepted
  public async changeStatusTicket(id: string, stateOfTicket: string) {
    if (!id) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    if (stateOfTicket !== 'accepted' && stateOfTicket !== 'finished')
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El estado del ticket no es válido.', true);

    let udpateObject: IUpdateObject = {};

    if (stateOfTicket === 'accepted') {
      udpateObject.date_accepted = new Date();
    } else if (stateOfTicket === 'finished') {
      udpateObject.date_finished = new Date();
      udpateObject.finished = true;
    }

    const ticketStore = await this.ticketRepo.findOne({ id }, 'id');
    if (!ticketStore)
      throw new ApiError(
        'Not Found Tickete',
        httpStatus.NOT_FOUND,
        'No se ha encotrado el Ticket asociado al ID enviado.',
        true
      );

    const ticketUpdated = await this.ticketRepo.updateOne({ id }, udpateObject);

    const response = await this.ticketRepo.find(
      { _id: ticketUpdated?._id },
      'id product.name product.id product.price product.ingredients ingredients selected_products.id'
    );

    return response[0];
  }
}
