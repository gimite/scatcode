require "json"

scatcode_data = open("../domain_data/sitelenpona/scatcode.json") do |file|
  JSON.load(file)
end

lasina_to_sp = {}
for char_data in scatcode_data["characters"]
  name = char_data["name"]
  char = char_data["codepoint"].to_i(16).chr(Encoding::UTF_8)
  case name
  when /^IDEOGRAPH (.+)$/
    lasina = $1.downcase
  when "START OF CARTOUCHE"
    lasina = "["
  when "END OF CARTOUCHE"
    lasina = "]"
  when "MIDDLE DOT"
    lasina = "*"
  else
    next
  end
  lasina_to_sp[lasina] = char
end

@current_domain = ""

def print_scatcode(str, domain)
  if domain != @current_domain
    print("\u{e0001}" + domain.chars.map { |c| (0xe0000 + c.ord).chr(Encoding::UTF_8) }.join("") + "\u{e007f}")
    @current_domain = domain
  end
  print(str)
end

ARGF.each_line do |line|
  for word in line.chomp.split(/\s+/)
    if sp = lasina_to_sp[word]
      print_scatcode(sp, "sitelenpona.gimite.net")
    else
      print_scatcode(word, "")
    end
  end
  print_scatcode("\n", "")
end
