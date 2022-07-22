# tests/integration/post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# john@email.com:test@23
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==
# We're sending a plain text fragment with unsupported fragment type
Content-Type: application/msword
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# We expect to get back an HTTP 415
HTTP/1.1 415
Content-Type: application/json; charset=utf-8
# We have various assertions about the response that we want to check
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
jsonpath "$.error.message" isString
