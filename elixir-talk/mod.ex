defmodule M do
  IO.puts "compiling M"
  def foo, do: "foo"

  defmodule M do
    IO.puts "compiling #{inspect __MODULE__}"
    def bar, do: "bar UPDATED"
  end
end

IO.puts "Hello"
