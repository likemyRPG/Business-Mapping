package world.inetum.businessmapping.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

import java.time.LocalDate;

@Data
@Node("Project")
@NoArgsConstructor
public class ProjectEntity {
    @Id
    private String uuid;

    @Property("name")
    private String name;

    @Property("success")
    private boolean success;

    @Property("year")
    private int year;

    @Property("status")
    private String status;

    @Property("startDate")
    private LocalDate startDate;

    @Property("endDate")
    private LocalDate endDate;

    @Property("scope")
    private String scope;

    @Property("budget")
    private long budget;

    @Property("onTime")
    private boolean onTime;

    @Property("actualCost")
    private long actualCost;

    @Property("impact")
    private String impact;
}