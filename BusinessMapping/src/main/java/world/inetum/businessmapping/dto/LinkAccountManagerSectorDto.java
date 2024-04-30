package world.inetum.businessmapping.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LinkAccountManagerSectorDto {

    // Getters and Setters
    private String accountManagerId;
    private String sectorId;

    public LinkAccountManagerSectorDto(String accountManagerId, String sectorId) {
        this.accountManagerId = accountManagerId;
        this.sectorId = sectorId;
    }

    // toString, equals, and hashCode methods can be added for debugging and comparison purposes
    @Override
    public String toString() {
        return "Link{" +
                "customerId='" + accountManagerId + '\'' +
                ", sectorId='" + sectorId + '\'' +
                '}';
    }

    // Implement equals() and hashCode() if necessary, especially if Link objects will be used in collections that require these methods.
}
