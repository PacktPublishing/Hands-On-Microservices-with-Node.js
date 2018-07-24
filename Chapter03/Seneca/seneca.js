const seneca  = require("seneca");
const service = seneca();

service.use("./imagini2.js", { path: __dirname + "/uploads" });

service.listen(3000);


/*
curl -H "Content-Type: application/json" \
--data '{"role":"upload","image":"example.png","data":"'"$( base64 example.png)"'"}' \
http://localhost:3000/act

curl -H "Content-Type: application/json" \
--data '{"role":"check","image":"other.png"}' \
http://localhost:3000/act

curl -H "Content-Type: application/json" \
--data '{"role":"download","image":"example.png","greyscale":true,"height":100}' \
http://localhost:3000/act \
| jq -r '.data' | base64 --decode > example2.png

curl -H "Content-Type: application/json" \
--data '{"role":"download","image":"other.png"}' \
http://localhost:3000/act \
| jq -r '.data | length'

curl -H "Content-Type: application/json" --data '{"role":"download","image":"example.png"}' http://localhost:3000/act

curl -H "Content-Type: application/json" --data '{"role":"download","image":"example.png","flip":true}' http://localhost:3000/act | jq -r '.data' | example2.png
*/
