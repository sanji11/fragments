# tests/integration/lab-10-dynamodb.hurl
# 1. POST a JSON fragment to http://localhost:8080 as an authorized user. The fragment's body should be the JSON value, { "service": "DynamoDB" }.

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# john@email.com:test@23
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==
# We're sending a json fragment - Body of the request in json object
Content-Type: application/json
{ "service": "DynamoDB" }

# 2. We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use https://www.npmjs.com/package/nanoid
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
# 19 is the length of our fragment data: '{ "service": "DynamoDB" }'
jsonpath "$.fragment.size" == 25
# Capture the Location header value and the fragment's id in variables named fragment1_url and fragment1_id
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 3. GET the fragment info (i.e., metadata) for the fragment you just created using the Location URL/info as an authorized user
GET {{fragment1_url}}/info
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

# 3.1. Confirm that the server returns a 200, that the type of the fragment is application/json, and that the body is equal to { "service": "DynamoDB" }
HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"


# 4. POST a second Markdown fragment to http://localhost:8080 as the same authorized user. 
POST http://localhost:8080/v1/fragments
# john@email.com:test@23
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==
# We're sending a text/markdown fragment
Content-Type: text/markdown
# Body of the request goes in ```...``` when it's a string
```DynamoDB is **great**.```

# 5. We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use https://www.npmjs.com/package/nanoid
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
# 22 is the length of our fragment data: 'DynamoDB is **great**.'
jsonpath "$.fragment.size" == 22
# Capture the Location header value and the fragment's id in variables named fragment1_url and fragment1_id
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 6. GET the fragment info (i.e., metadata) for the fragment you just created using the Location URL/info as an authorized user
GET {{fragment2_url}}/info
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"


# 7. GET all of the fragments for the same authorized user without expanding them
GET http://localhost:8080/v1/fragments
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

HTTP/1.1 200
# 7.1. Confirm that the list of fragments includes the two id values captured above
[Asserts]
jsonpath "$.fragments" includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"

# 8 DELETE the first fragment using the url as an authorized user.

DELETE {{fragment1_url}}
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

# 9. Confirm that the server returns a 200.
HTTP/1.1 200

# 10. Try to GET the first fragment again using the url as an authorized user.
GET {{fragment1_url}}/info
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

# 11. Confirm that the server returns a 404, since the fragment should be deleted.
HTTP/1.1 404

# 12. GET all of the fragments for the same authorized user without expanding them
GET http://localhost:8080/v1/fragments
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

HTTP/1.1 200
# 7.1. Confirm that the list of fragments includes the two id values captured above
[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}
