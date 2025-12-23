require "json"
require "fileutils"

ucsur_characters = []

File.readlines("UCSUR_UnicodeData.txt").each do |line|
  fields = line.chomp.split(";")
  ucsur_characters.push({
    "codepoint" => fields[0],
    "fullName" => fields[1],
  })
end

for (domain_name, name_regex) in [
    ["sitelenpona", /^SITELEN PONA (.+)$/],
    ["tengwar", /^TENGWAR (.+)$/],
    ["liparxe", nil],
    ["oldhylian", nil],
    ["futuramaalien", nil],
  ]
  data = open("#{domain_name}.scatcode_basic.json") { |f| JSON.load(f) }
  if name_regex
    data["characters"] = ucsur_characters.filter_map do |ch|
      name_match = ch["fullName"].match(name_regex)
      if name_match
        {
          "codepoint" => ch["codepoint"],
          "name" => name_match[1],
        }
      else
        nil
      end
    end
  end

  FileUtils.mkdir_p(domain_name)
  File.open("#{domain_name}/scatcode.json", "w") do |f|
    f.write(JSON.pretty_generate(data))
  end
end
