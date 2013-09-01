### 0 ###

mix new github

### 1 ###

    [{ :httpotion, "0.2.0", github: "myfreeweb/httpotion" }]

### 2 ###

mix deps.get

### 3 ###

    [applications: [:httpotion]]

### 4 ###

  @moduledoc "A simple GitHub client\n"

  @doc "Fetch JSON from GitHub at the specified path"
  def run(path) do
    HTTPotion.get "https://api.github.com/" <> path
    #HTTPotion.Response[body: File.read! "../json/#{Path.basename(path)}.json"]
  end

### 5 ###

mix run -e 'IO.inspect Github.run("repos/elixir-lang/elixir")'

### 6 ###

  @doc "Fetch data from GitHub and return the value for the specified key"
  def get(path, key) do
    json = run(path).body
    dict = JSON.decode!(json, as: HashDict)
    Dict.get dict, key
  end

### 7 ###

     { :jazz, github: "meh/jazz" }

### 8 ###

mix run -e 'IO.puts Github.get("repos/elixir-lang/elixir", "description")'

### 9 ###

  defrecord User, [:login, :location, :public_repos]

### 10 ###

  @doc "Fetch an object from the path and put it into the specified container type"
  def get_obj(path, container // HashDict) do
    json = run(path).body
    JSON.decode!(json, as: container)
  end

### 11 ###

mix run -e 'IO.inspect Github.get_obj("users/alco")'

### 12 ###

mix run -e 'IO.inspect Github.get_obj("users/alco", Github.User)'

### 13 ###

iex -S mix
user = Github.get_obj("users/alco", Github.User)

### 14 ###

defimpl Binary.Chars, for: Github.User do
  def to_binary(Github.User[login: login, location: loc]) do
    "#{login} is currently presenting in #{loc}"
  end
end

### 15 ###

r Github

##

h Github

### 16 ###

defrecord Github.StarredRepo, [:name]

### 17 ###

mix run -e 'IO.inspect Github.get_obj("users/alco/starred", [Github.StarredRepo])'

### 18 ###

defimpl JSON.Decoder, for: Github.StarredRepo do
  def from_json({ _, parsed, _ }) do
    { _, name } = List.keyfind parsed, "full_name", 0
    Github.StarredRepo[name: name]
  end
end

### 19 ###

mix run -e 'IO.inspect Github.get_obj("users/alco/starred", [Github.StarredRepo])'

### 20 ###

defmodule Meta do
  defmacro fetch_user(name) do
    user = Github.get_obj("users/#{name}")
    fields = Enum.map user, fn {k, v} -> {binary_to_atom(k), v} end
    module_name = Module.concat User, String.capitalize(user["login"])

    defrecord module_name, fields
  end
end

### 21 ###

defmodule Users do
  Meta.fetch_user "proger"
end

