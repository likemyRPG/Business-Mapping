package world.inetum.businessmapping.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.entity.AccountManagerEntity;
import world.inetum.businessmapping.service.AccountManagerService;

@RestController
@RequestMapping("/api/account-managers")
public class AccountManagerController {

    private final AccountManagerService accountManagerService;

    @Autowired
    public AccountManagerController(AccountManagerService accountManagerService) {
        this.accountManagerService = accountManagerService;
    }

    @Operation(summary = "Get all account managers", description = "Retrieve a list of all account managers", tags = {"account managers"})
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    Flux<AccountManagerEntity> getAllAccountManagers() {
        return accountManagerService.findAll();
    }
}
