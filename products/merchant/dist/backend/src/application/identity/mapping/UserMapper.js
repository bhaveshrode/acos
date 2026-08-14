/**
 * Mapper helper converting User entities into presentation UserResponseDto models.
 */
export class UserMapper {
    map(source) {
        return {
            id: source.id.value,
            email: source.email.value,
            name: source.name,
            status: source.status,
            createdAt: source.createdAt.toISOString(),
            updatedAt: source.updatedAt.toISOString()
        };
    }
}
