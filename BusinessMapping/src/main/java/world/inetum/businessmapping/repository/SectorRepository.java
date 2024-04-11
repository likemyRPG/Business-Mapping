package world.inetum.businessmapping.repository;

import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import world.inetum.businessmapping.entity.SectorEntity;

public interface SectorRepository extends ReactiveNeo4jRepository<SectorEntity, String> {

}
