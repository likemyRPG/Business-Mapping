package world.inetum.businessmapping.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.entity.SectorEntity;
import world.inetum.businessmapping.service.SectorService;

@RestController
@RequestMapping("/api/sectors")
public class SectorController {

    private final SectorService sectorService;

    public SectorController(SectorService sectorService) {this.sectorService = sectorService;}

    @Operation(summary = "Get all Sectors", description = "Retrieve a list of all sectors", tags = {"sectors"})
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<SectorEntity> getAllSectors() {
        return sectorService.findAll();
    }
}
