#!/bin/sh

yaml() {
  docker run --rm -i -v "${PWD}":/workdir mikefarah/yq yq "$@"
}

parse_image() {
    service_name=$1
    service_version=$(cat "$service_name/package.json" | jq .version --raw-output)
    printf "docker.pkg.github.com/czarsimon/webca/$service_name:$service_version"
}

update_image() {
    service_name=$1
    image_name=$(parse_image $service_name)
    yaml write --inplace "k8s/application/$service_name/deployment.yml" spec.template.spec.containers[0].image $image_name
}

services=("api-server" "web-app")

for service in "${services[@]}"
do
    update_image $service
    image_name=$(parse_image $service_name)
    echo "Updated image for service $service. image = $image_name"
done
