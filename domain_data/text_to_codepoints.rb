require "json"

characters = ARGF.read.chars.map do |char|
  {
    "codepoint" => char.ord.to_s(16).upcase.rjust(4, "0"),
    "name" => "LETTER ",
  }
end
puts(JSON.pretty_generate(characters))
