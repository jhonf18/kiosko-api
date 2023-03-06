import moment from 'moment';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { getIndexOfElmentInArray } from './../../../utilities/index';
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

    // Create an array with the parameters to get the tickets, separate the getData string
    let dataArray = getData.split(',');

    // Add product_variant_id to parameters to get
    dataArray.push('product_variant_id');

    // Convert the array to a string again, this process is done to remove the commas from the getData string
    getData = dataArray.join(' ');

    // Find tickets per days
    if (filter.today) {
      // Get date with format
      const today = moment(new Date(Number(filter.today)));
      // Add the search filter for tickets after a certain date
      filter.created_at = { $gte: today.utc() };
    }

    // Find tickets in DB
    let tickets = (await this.ticketRepo.find(filter, getData)) as any;

    // Remove javascript object references to be able to add and remove properties to the response object
    tickets = JSON.parse(JSON.stringify(tickets));

    for (const ticket of tickets) {
      // If the array of variants exists, only the one that was selected will be chosen to be sent to the client
      if (ticket.product && ticket.product.variants && ticket.product_variant_id) {
        const variantIndex = getIndexOfElmentInArray(
          ticket.product.variants.map((el: any) => el.id),
          ticket.product_variant_id
        );

        // If exists variant in Array
        if (typeof variantIndex === 'number') {
          // We select the variant and only that variant is added to the response object
          const variant = ticket.product.variants[variantIndex];
          ticket.product.variant = variant;

          // We eliminate the fields that are not necessary for the client
          delete ticket.product.variants;
        }
      }
      // If there custom product of ticket
      else if (ticket.custom_product) {
        ticket.product = ticket.custom_product;
        ticket.customized_product_data =
          ticket.custom_product.ingredients && ticket.custom_product.ingredients.length > 0 ? 'ingredients' : 'variant';
        ticket.custom_product = true;
      }

      // We eliminate the fields that are not necessary for the client
      delete ticket.product_variant_id;
    }

    return tickets;
  }

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
    return { ticket: ticketUpdated };
  }
}
