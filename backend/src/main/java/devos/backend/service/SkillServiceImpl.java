package devos.backend.service;

import devos.backend.dto.SkillDto;
import devos.backend.dto.UserSkillDto;
import devos.backend.model.Skill;
import devos.backend.model.User;
import devos.backend.model.UserSkill;
import devos.backend.repository.SkillRepository;
import devos.backend.repository.UserRepository;
import devos.backend.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SkillDto> getAllSkills() {
        return skillRepository.findAllByOrderByCategoryAscNameAsc()
                .stream()
                .map(this::mapSkillToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSkillDto> getUserSkills(UUID userId) {
        return userSkillRepository.findByUserId(userId)
                .stream()
                .map(this::mapUserSkillToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserSkillDto addUserSkill(UUID userId, UUID skillId, UserSkill.ProficiencyLevel level) {
        if (userSkillRepository.existsByUserIdAndSkillId(userId, skillId)) {
            // Update existing instead of duplicate
            return updateUserSkillLevel(userId, skillId, level);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found: " + skillId));
        
        UserSkill userSkill = UserSkill.builder()
                .user(user)
                .skill(skill)
                .level(level)
                .build();
        return mapUserSkillToDto(userSkillRepository.save(userSkill));
    }

    @Override
    public UserSkillDto updateUserSkillLevel(UUID userId, UUID skillId, UserSkill.ProficiencyLevel level) {
        UserSkill existing = userSkillRepository.findByUserIdAndSkillId(userId, skillId)
                .orElseThrow(() -> new RuntimeException("User skill not found"));
        existing.setLevel(level);
        return mapUserSkillToDto(userSkillRepository.save(existing));
    }

    @Override
    public void removeUserSkill(UUID userId, UUID skillId) {
        userSkillRepository.deleteByUserIdAndSkillId(userId, skillId);
    }

    private SkillDto mapSkillToDto(Skill skill) {
        return SkillDto.builder()
                .id(skill.getId())
                .name(skill.getName())
                .category(skill.getCategory())
                .iconSlug(skill.getIconSlug())
                .build();
    }

    private UserSkillDto mapUserSkillToDto(UserSkill us) {
        return UserSkillDto.builder()
                .id(us.getId())
                .skillId(us.getSkill().getId())
                .name(us.getSkill().getName())
                .category(us.getSkill().getCategory().name())
                .iconSlug(us.getSkill().getIconSlug())
                .level(us.getLevel())
                .build();
    }
}
