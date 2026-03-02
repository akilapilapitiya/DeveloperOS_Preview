package devos.backend.dto;

import devos.backend.model.EventRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipantDto {
    private UUID id;
    private UUID eventId;
    private String eventName;
    private String organizationName;
    private UUID userId;
    private String username;
    private String avatarPath;
    private String githubAvatarUrl;
    private EventRole role;
    private LocalDateTime joinedAt;
}
