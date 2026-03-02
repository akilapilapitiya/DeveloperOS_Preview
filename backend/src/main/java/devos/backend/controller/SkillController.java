package devos.backend.controller;

import devos.backend.dto.SkillDto;
import devos.backend.dto.UserSkillDto;
import devos.backend.model.Skill;
import devos.backend.model.UserSkill;
import devos.backend.repository.SkillRepository;
import devos.backend.service.SkillService;
import devos.backend.service.UserService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;
    private final UserService userService;
    private final SkillRepository skillRepository;

    // --------------- Catalog ---------------

    /** Browse the full skills catalog (public). */
    @GetMapping
    public ResponseEntity<List<SkillDto>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    // --------------- Current user's skills ---------------

    @GetMapping("/me")
    public ResponseEntity<List<UserSkillDto>> getMySkills(@AuthenticationPrincipal Jwt jwt) {
        var me = userService.getOrCreateUser(
                jwt.getSubject(),
                jwt.getClaimAsString("preferred_username"),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name"));
        return ResponseEntity.ok(skillService.getUserSkills(me.getId()));
    }

    @PostMapping("/me/{skillId}")
    public ResponseEntity<UserSkillDto> addSkill(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID skillId,
            @RequestBody Map<String, String> body) {

        var level = UserSkill.ProficiencyLevel.valueOf(
                body.getOrDefault("level", "INTERMEDIATE"));
        var me = userService.getCurrentUser();
        return ResponseEntity.ok(skillService.addUserSkill(me.getId(), skillId, level));
    }

    @PutMapping("/me/{skillId}")
    public ResponseEntity<UserSkillDto> updateSkillLevel(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID skillId,
            @RequestBody Map<String, String> body) {

        var level = UserSkill.ProficiencyLevel.valueOf(body.get("level"));
        var me = userService.getCurrentUser();
        return ResponseEntity.ok(skillService.updateUserSkillLevel(me.getId(), skillId, level));
    }

    @DeleteMapping("/me/{skillId}")
    public ResponseEntity<Void> removeSkill(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID skillId) {

        var me = userService.getCurrentUser();
        skillService.removeUserSkill(me.getId(), skillId);
        return ResponseEntity.noContent().build();
    }

    // --------------- Seed catalog on startup ---------------

    @PostConstruct
    public void seedSkillsCatalog() {
        record S(String name, Skill.SkillCategory cat, String icon) {}
        List<S> seeds = List.of(
            // ── Languages ───────────────────────────────────────────────────
            new S("TypeScript",   Skill.SkillCategory.LANGUAGE,  "typescript"),
            new S("JavaScript",   Skill.SkillCategory.LANGUAGE,  "javascript"),
            new S("Python",       Skill.SkillCategory.LANGUAGE,  "python"),
            new S("Java",         Skill.SkillCategory.LANGUAGE,  "java"),
            new S("Go",           Skill.SkillCategory.LANGUAGE,  "go"),
            new S("Rust",         Skill.SkillCategory.LANGUAGE,  "rust"),
            new S("C",            Skill.SkillCategory.LANGUAGE,  "c"),
            new S("C++",          Skill.SkillCategory.LANGUAGE,  "cplusplus"),
            new S("C#",           Skill.SkillCategory.LANGUAGE,  "csharp"),
            new S("Kotlin",       Skill.SkillCategory.LANGUAGE,  "kotlin"),
            new S("Swift",        Skill.SkillCategory.LANGUAGE,  "swift"),
            new S("Ruby",         Skill.SkillCategory.LANGUAGE,  "ruby"),
            new S("PHP",          Skill.SkillCategory.LANGUAGE,  "php"),
            new S("Scala",        Skill.SkillCategory.LANGUAGE,  "scala"),
            new S("R",            Skill.SkillCategory.LANGUAGE,  "r"),
            new S("Dart",         Skill.SkillCategory.LANGUAGE,  "dart"),
            new S("Elixir",       Skill.SkillCategory.LANGUAGE,  "elixir"),
            new S("Haskell",      Skill.SkillCategory.LANGUAGE,  "haskell"),
            new S("Perl",         Skill.SkillCategory.LANGUAGE,  "perl"),
            new S("Bash",         Skill.SkillCategory.LANGUAGE,  "bash"),
            new S("Lua",          Skill.SkillCategory.LANGUAGE,  "lua"),
            new S("Zig",          Skill.SkillCategory.LANGUAGE,  "zig"),
            // ── Frameworks ────────────────────────────────────────────────
            new S("React",        Skill.SkillCategory.FRAMEWORK, "react"),
            new S("Next.js",      Skill.SkillCategory.FRAMEWORK, "nextjs"),
            new S("Vue",          Skill.SkillCategory.FRAMEWORK, "vuejs"),
            new S("Angular",      Skill.SkillCategory.FRAMEWORK, "angularjs"),
            new S("Svelte",       Skill.SkillCategory.FRAMEWORK, "svelte"),
            new S("Nuxt.js",      Skill.SkillCategory.FRAMEWORK, "nuxtjs"),
            new S("Spring Boot",  Skill.SkillCategory.FRAMEWORK, "spring"),
            new S("Django",       Skill.SkillCategory.FRAMEWORK, "django"),
            new S("FastAPI",      Skill.SkillCategory.FRAMEWORK, "fastapi"),
            new S("Flask",        Skill.SkillCategory.FRAMEWORK, "flask"),
            new S("Node.js",      Skill.SkillCategory.FRAMEWORK, "nodejs"),
            new S("Express",      Skill.SkillCategory.FRAMEWORK, "express"),
            new S("NestJS",       Skill.SkillCategory.FRAMEWORK, "nestjs"),
            new S("Laravel",      Skill.SkillCategory.FRAMEWORK, "laravel"),
            new S("Rails",        Skill.SkillCategory.FRAMEWORK, "rails"),
            new S("Flutter",      Skill.SkillCategory.FRAMEWORK, "flutter"),
            new S("React Native", Skill.SkillCategory.FRAMEWORK, "react"),
            new S("GraphQL",      Skill.SkillCategory.FRAMEWORK, "graphql"),
            new S("gRPC",         Skill.SkillCategory.FRAMEWORK, "grpc"),
            // ── DevOps ────────────────────────────────────────────────────
            new S("Docker",       Skill.SkillCategory.DEVOPS,    "docker"),
            new S("Kubernetes",   Skill.SkillCategory.DEVOPS,    "kubernetes"),
            new S("Helm",         Skill.SkillCategory.DEVOPS,    "helm"),
            new S("GitHub Actions", Skill.SkillCategory.DEVOPS,  "github"),
            new S("GitLab CI",    Skill.SkillCategory.DEVOPS,    "gitlab"),
            new S("Terraform",    Skill.SkillCategory.DEVOPS,    "terraform"),
            new S("Ansible",      Skill.SkillCategory.DEVOPS,    "ansible"),
            new S("Jenkins",      Skill.SkillCategory.DEVOPS,    "jenkins"),
            new S("Linux",        Skill.SkillCategory.DEVOPS,    "linux"),
            new S("Nginx",        Skill.SkillCategory.DEVOPS,    "nginx"),
            new S("Prometheus",   Skill.SkillCategory.DEVOPS,    "prometheus"),
            new S("Grafana",      Skill.SkillCategory.DEVOPS,    "grafana"),
            new S("ArgoCD",       Skill.SkillCategory.DEVOPS,    "argocd"),
            new S("Pulumi",       Skill.SkillCategory.DEVOPS,    "pulumi"),
            // ── Databases ─────────────────────────────────────────────────
            new S("PostgreSQL",   Skill.SkillCategory.DATABASE,  "postgresql"),
            new S("MySQL",        Skill.SkillCategory.DATABASE,  "mysql"),
            new S("MongoDB",      Skill.SkillCategory.DATABASE,  "mongodb"),
            new S("Redis",        Skill.SkillCategory.DATABASE,  "redis"),
            new S("Elasticsearch", Skill.SkillCategory.DATABASE, "elasticsearch"),
            new S("Cassandra",    Skill.SkillCategory.DATABASE,  "cassandra"),
            new S("SQLite",       Skill.SkillCategory.DATABASE,  "sqlite"),
            new S("DynamoDB",     Skill.SkillCategory.DATABASE,  "dynamodb"),
            new S("Neo4j",        Skill.SkillCategory.DATABASE,  "neo4j"),
            new S("ClickHouse",   Skill.SkillCategory.DATABASE,  "clickhouse"),
            new S("Kafka",        Skill.SkillCategory.DATABASE,  "apachekafka"),
            new S("RabbitMQ",     Skill.SkillCategory.DATABASE,  "rabbitmq"),
            // ── Cloud ─────────────────────────────────────────────────────
            new S("AWS",          Skill.SkillCategory.CLOUD,     "amazonwebservices"),
            new S("GCP",          Skill.SkillCategory.CLOUD,     "googlecloud"),
            new S("Azure",        Skill.SkillCategory.CLOUD,     "azure"),
            new S("Vercel",       Skill.SkillCategory.CLOUD,     "vercel"),
            new S("Cloudflare",   Skill.SkillCategory.CLOUD,     "cloudflare"),
            new S("DigitalOcean", Skill.SkillCategory.CLOUD,     "digitalocean"),
            new S("Heroku",       Skill.SkillCategory.CLOUD,     "heroku"),
            new S("Supabase",     Skill.SkillCategory.CLOUD,     "supabase"),
            new S("Firebase",     Skill.SkillCategory.CLOUD,     "firebase")
        );


        int seeded = 0;
        for (S s : seeds) {
            if (!skillRepository.existsByNameIgnoreCase(s.name())) {
                skillRepository.save(Skill.builder()
                        .name(s.name())
                        .category(s.cat())
                        .iconSlug(s.icon())
                        .build());
                seeded++;
            }
        }
        if (seeded > 0) log.info("Seeded {} skills into catalog", seeded);
    }
}
