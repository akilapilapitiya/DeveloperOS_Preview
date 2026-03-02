package devos.backend.controller;

import devos.backend.dto.UserDto;
import devos.backend.model.User;
import devos.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList()));
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .githubUsername(user.getGithubUsername())
                .githubAvatarUrl(user.getGithubAvatarUrl())
                .avatarPath(user.getAvatarPath())
                .active(user.isActive())
                .build();
    }
}
