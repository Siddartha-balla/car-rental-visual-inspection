package com.carrental.backend.service;

import com.carrental.backend.dto.DamagePredictionResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class DamageInspectionService {

    // 🔗 Flask ML API endpoint
    private static final String ML_API_URL = "http://127.0.0.1:5000/predict";

    /**
     * Calls ML service with before & after images
     * @param before pickup image file
     * @param after return image file
     * @return ML prediction response
     */
    public DamagePredictionResponse inspectDamage(
            File before,
            File after
    ) throws Exception {

        // Create HTTP client
        CloseableHttpClient client = HttpClients.createDefault();

        // Create POST request
        HttpPost post = new HttpPost(ML_API_URL);

        // Build multipart request (before & after images)
        HttpEntity entity = MultipartEntityBuilder.create()
                .addBinaryBody("before", before)
                .addBinaryBody("after", after)
                .build();

        post.setEntity(entity);

        // Execute request
        CloseableHttpResponse response = client.execute(post);

        // Parse JSON response
        ObjectMapper mapper = new ObjectMapper();
        DamagePredictionResponse result = mapper.readValue(
                response.getEntity().getContent(),
                DamagePredictionResponse.class
        );

        // Close resources
        response.close();
        client.close();

        return result;
    }
}
