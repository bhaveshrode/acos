/**
 * ValueObjectConverter extracting inner props or value elements from ValueObject topologies.
 */
export class ValueObjectConverter {
  public serialize(vo: any): any {
    if (vo && typeof vo === "object" && "props" in vo) {
      return vo.props;
    }
    if (vo && typeof vo === "object" && "value" in vo) {
      return vo.value;
    }
    return vo;
  }
}
