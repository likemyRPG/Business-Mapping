package world.inetum.businessmapping.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.dto.LinkAccountManagerSectorDto;
import world.inetum.businessmapping.entity.AccountManagerEntity;
import world.inetum.businessmapping.repository.AccountManagerRepository;

@Service
public class AccountManagerService {

    private final AccountManagerRepository accountManagerRepository;

    @Autowired
    public AccountManagerService(AccountManagerRepository accountManagerRepository) {
        this.accountManagerRepository = accountManagerRepository;
    }

    public Flux<AccountManagerEntity> findAll() {
        return accountManagerRepository.findAll();
    }

    public Flux<LinkAccountManagerSectorDto> findAllAccountManagerSectorRelationsAsLinks() {
        return accountManagerRepository.findAllAccountManagerSectorRelations()
                .map(dto -> new LinkAccountManagerSectorDto(dto.getAccountManagerId(), dto.getSectorId()));
    }
}
