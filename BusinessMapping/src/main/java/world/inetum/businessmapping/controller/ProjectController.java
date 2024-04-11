package world.inetum.businessmapping.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.entity.ProjectEntity;
import world.inetum.businessmapping.service.ProjectService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {this.projectService = projectService;}

    @Operation(summary = "Get all Projects", description = "Retrieve a list of all projects", tags = {"projects"})
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<ProjectEntity> getAllSectors() {
        return projectService.findAll();
    }
}
