/**
 * DateTimeConverter normalizing dates to and from ISO strings formats.
 */
export class DateTimeConverter {
  public format(date: Date): string {
    return date.toISOString();
  }

  public parse(dateStr: string): Date {
    return new Date(dateStr);
  }
}
