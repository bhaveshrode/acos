import { MapperBase } from "../common/MapperBase.js";

export interface GenericAlert {
  targetEmail: string;
  title: string;
  username: string;
  body: string;
}

export interface SmtpPayload {
  recipientAddress: string;
  mailSubject: string;
  htmlBody: string;
}

/**
 * Mapper converting custom alert items into SMTP recipient parameters.
 */
export class NotificationMapper extends MapperBase<GenericAlert, SmtpPayload> {
  public map(source: GenericAlert): SmtpPayload {
    return {
      recipientAddress: source.targetEmail,
      mailSubject: source.title,
      htmlBody: `<h3>Hello ${source.username}</h3><p>${source.body}</p>`
    };
  }
}
