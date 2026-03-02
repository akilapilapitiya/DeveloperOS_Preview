package devos.backend.controller;

import devos.backend.dto.FollowStatsDto;
import devos.backend.dto.FollowUserDto;
import devos.backend.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    /** Follow a user by their GitHub username. */
    @PostMapping("/{username}")
    public ResponseEntity<Void> follow(@PathVariable String username,
                                       @AuthenticationPrincipal Jwt jwt) {
        followService.follow(jwt.getSubject(), username);
        return ResponseEntity.ok().build();
    }

    /** Unfollow a user. */
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> unfollow(@PathVariable String username,
                                         @AuthenticationPrincipal Jwt jwt) {
        followService.unfollow(jwt.getSubject(), username);
        return ResponseEntity.noContent().build();
    }

    /** Check whether the authenticated user follows {username}. */
    @GetMapping("/{username}/status")
    public ResponseEntity<Boolean> status(@PathVariable String username,
                                          @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(followService.isFollowing(jwt.getSubject(), username));
    }

    /** Follower + following counts (public). Viewer's isFollowing flag included when auth provided. */
    @GetMapping("/{username}/stats")
    public ResponseEntity<FollowStatsDto> stats(
            @PathVariable String username,
            Authentication authentication) {
        String keycloakId = null;
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            keycloakId = jwtAuth.getToken().getSubject();
        }
        return ResponseEntity.ok(followService.getStats(username, keycloakId));
    }

    /** List of followers (public). */
    @GetMapping("/{username}/followers")
    public ResponseEntity<List<FollowUserDto>> followers(@PathVariable String username) {
        return ResponseEntity.ok(followService.getFollowers(username));
    }

    /** List of users this person follows (public). */
    @GetMapping("/{username}/following")
    public ResponseEntity<List<FollowUserDto>> following(@PathVariable String username) {
        return ResponseEntity.ok(followService.getFollowing(username));
    }
}
