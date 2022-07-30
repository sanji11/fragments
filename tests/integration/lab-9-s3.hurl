# tests/integration/lab-9-s3.hurl
# 1. POST a new text fragment to http://localhost:8080 as an authorized user. The fragment's body should be the string, Hello S3!.

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# john@email.com:test@23
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==
# We're sending a plain text fragment
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
```Hello S3!```

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
jsonpath "$.fragment.type" == "text/plain"
# 19 is the length of our fragment data: 'Hello S3!'
jsonpath "$.fragment.size" == 9
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 3. GET the fragment you just created using the url as an authorized user
GET {{url}}
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

# 4. Confirm that the server returns a 200, that the type of the fragment is text/plain, and that the body is equal to Hello S3!
HTTP/1.1 200
Content-Type: text/plain
Content-Length: 9
[Asserts]
body == "Hello S3!"

# 5. DELETE the fragment using the url as an authorized user.

DELETE {{url}}
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

# 6. Confirm that the server returns a 200.
HTTP/1.1 200

# 7. Try to GET the fragment again using the url as an authorized user.
GET {{url}}
Authorization: Basic am9obkBlbWFpbC5jb206dGVzdEAyMw==

# 8. Confirm that the server returns a 404, since the fragment should be deleted.
HTTP/1.1 404

