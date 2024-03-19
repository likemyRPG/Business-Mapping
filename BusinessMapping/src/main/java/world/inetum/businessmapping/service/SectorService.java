package world.inetum.businessmapping.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.entity.SectorEntity;
import world.inetum.businessmapping.repository.SectorRepository;

@Service
public class SectorService {
    private final SectorRepository sectorRepository;

    @Autowired
    public SectorService(SectorRepository sectorRepository) {
        this.sectorRepository = sectorRepository;
    }

    public Flux<SectorEntity> findAll() {
        return sectorRepository.findAll();
    }
}
