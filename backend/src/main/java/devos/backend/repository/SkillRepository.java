package devos.backend.repository;

import devos.backend.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SkillRepository extends JpaRepository<Skill, UUID> {
    List<Skill> findAllByOrderByCategoryAscNameAsc();
    List<Skill> findByCategoryOrderByNameAsc(Skill.SkillCategory category);
    boolean existsByNameIgnoreCase(String name);
}
