package devos.backend.dto;

import devos.backend.model.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillDto {
    private UUID id;
    private String name;
    private Skill.SkillCategory category;
    private String iconSlug;
}
