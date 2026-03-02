package devos.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill extends BaseModel {

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillCategory category;

    /** Devicon slug, e.g. "typescript", "docker", "postgresql" */
    private String iconSlug;

    public enum SkillCategory {
        LANGUAGE, FRAMEWORK, DEVOPS, DATABASE, CLOUD, OTHER
    }
}
