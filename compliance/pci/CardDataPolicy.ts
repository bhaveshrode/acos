/**
 * CardDataPolicy specifying permitted cardholder information values.
 */
export class CardDataPolicy {
  public static isCVVPermitted(): boolean {
    return false; // Storage of CVV/CVC is strictly prohibited under PCI-DSS
  }

  public static isPANStoragePermitted(): boolean {
    return false; // Raw PAN storage is prohibited; only tokenized or masked PAN allowed
  }
}
