package world.inetum.businessmapping.dto;

public class LinkDto {

    private String customerId;
    private String sectorId;

    public LinkDto() {
        // Default constructor
    }

    public LinkDto(String customerId, String sectorId) {
        this.customerId = customerId;
        this.sectorId = sectorId;
    }

    // Getters and Setters
    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getSectorId() {
        return sectorId;
    }

    public void setSectorId(String sectorId) {
        this.sectorId = sectorId;
    }

    // toString, equals, and hashCode methods can be added for debugging and comparison purposes
    @Override
    public String toString() {
        return "Link{" +
                "customerId='" + customerId + '\'' +
                ", sectorId='" + sectorId + '\'' +
                '}';
    }

    // Implement equals() and hashCode() if necessary, especially if Link objects will be used in collections that require these methods.
}
