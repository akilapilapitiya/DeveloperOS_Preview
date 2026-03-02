package devos.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "github_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubConfig extends BaseModel {

    @Column(nullable = false, unique = true)
    private Long installationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false, unique = true)
    private Organization organization;

    @Builder.Default
    private boolean active = true;
}
