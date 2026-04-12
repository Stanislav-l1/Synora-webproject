package com.synora.modules.search.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SearchResponse {

    private List<?> posts;
    private List<?> projects;
    private List<?> users;
}
