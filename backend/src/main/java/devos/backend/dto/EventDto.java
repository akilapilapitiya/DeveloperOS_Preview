package devos.backend.dto;

import devos.backend.model.Event;
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
public class EventDto {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private Event.EventType type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxProjectsPerUser;
    private Event.EventStatus status;
    private UUID organizationId;
    private EventRole currentUserRole;
    private LocalDateTime createdAt;
}
