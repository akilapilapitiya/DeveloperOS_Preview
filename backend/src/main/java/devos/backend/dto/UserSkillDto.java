package devos.backend.dto;

import devos.backend.model.UserSkill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillDto {
    private UUID id;             // UserSkill row id
    private UUID skillId;
    private String name;
    private String category;
    private String iconSlug;
    private UserSkill.ProficiencyLevel level;
}
