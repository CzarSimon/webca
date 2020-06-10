service_name=$1
service_version=$(cat "../$service_name/package.json" | jq .version --raw-output)
printf "docker.pkg.github.com/czarsimon/webca/$service_name:$service_version"