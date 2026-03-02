package devos.backend.service;

import devos.backend.dto.ProfileUpdateDto;
import devos.backend.dto.UserDto;
import devos.backend.model.User;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    User getOrCreateUser(String keycloakId, String username, String email, String firstName, String lastName);
    Optional<User> getUserByEmail(String email);
    Optional<User> getUserById(UUID id);
    java.util.List<User> searchUsers(String query);
    User getCurrentUser();
    User saveUser(User user);
    User updateProfile(String keycloakId, ProfileUpdateDto updates);
    User updateAvatarPath(String keycloakId, String fileName);
}
