# tests/integration/post-fragments-json.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# john@email.com:test@23
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==
# We're sending a json fragment - Body of the request in json object
{"data" : "Testing text fragment"}

# We expect to get back an HTTP 201
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
# 19 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragment.size" == 34
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

HTTP/1.1 200
Content-Type: application/json
Content-Length: 34
[Asserts]
body == ```{"data" : "Testing text fragment"}```
