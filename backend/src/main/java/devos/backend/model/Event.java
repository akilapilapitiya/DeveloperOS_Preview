package devos.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private EventType type;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Column(name = "max_projects_per_user")
    private Integer maxProjectsPerUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'OPEN'")
    @Builder.Default
    private EventStatus status = EventStatus.OPEN;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum EventType {
        ACTIVITY, EVENT, COMPETITION, PROJECT_GROUP
    }

    public enum EventStatus {
        OPEN, CLOSED
    }
}
