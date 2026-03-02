package devos.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class StatusController {

    @GetMapping("/api/status")
    public Map<String, String> getStatus() {
        return Map.of(
            "status", "UP",
            "message", "Developer OS Backend is operational",
            "mission", "Plan-First, Ask-Before-Act"
        );
    }
}
