package world.inetum.businessmapping.repository;

import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.entity.CustomerEntity;

public interface CustomerRepository extends ReactiveNeo4jRepository<CustomerEntity, String> {
    Mono<CustomerEntity> findOneByName(String name);
}
