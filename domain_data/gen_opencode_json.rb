require "json"
require "fileutils"

domain_name = "sitelenpona"
name_regex = /^SITELEN PONA (.+)$/

data = open("#{domain_name}.opencode_basic.json") { |f| JSON.load(f) }
characters = []

File.readlines("UCSUR_UnicodeData.txt").each do |line|
  fields = line.chomp.split(";")
  codepoint = fields[0]
  full_name = fields[1]
  next unless full_name =~ name_regex
  name = $1

  characters.push({
    "codepoint" => codepoint,
    "name" => name,
  })
end

data["characters"] = characters

FileUtils.mkdir_p(domain_name)
File.open("#{domain_name}/opencode.json", "w") do |f|
  f.write(JSON.pretty_generate(data))
end
