/**
 * DTO carrying registration parameters for registering a User.
 */
export interface RegisterUserRequestDto {
  email: string;
  passwordPlaintext: string;
  name: string;
}
