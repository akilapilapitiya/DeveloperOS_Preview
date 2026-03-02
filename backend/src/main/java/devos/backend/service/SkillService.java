package devos.backend.service;

import devos.backend.dto.UserSkillDto;
import devos.backend.model.UserSkill;

import java.util.List;
import java.util.UUID;

public interface SkillService {
    List<devos.backend.dto.SkillDto> getAllSkills();
    List<UserSkillDto> getUserSkills(UUID userId);
    UserSkillDto addUserSkill(UUID userId, UUID skillId, UserSkill.ProficiencyLevel level);
    UserSkillDto updateUserSkillLevel(UUID userId, UUID skillId, UserSkill.ProficiencyLevel level);
    void removeUserSkill(UUID userId, UUID skillId);
}
