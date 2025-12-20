require "json"
require "optparse"

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
  when "COLON"
    lasina = ":"
  when "SCALING JOINER"
    lasina = "-"
  when "START OF LONG GLYPH"
    lasina = "{"
  when "END OF LONG GLYPH"
    lasina = "}"
  else
    next
  end
  lasina_to_sp[lasina] = char
end

# Parse command line options
@json_mode = false
OptionParser.new do |opts|
  opts.on("--json", "Enable JSON mode") do
    @json_mode = true
  end
end.parse!

@current_domain = ""

def print_in_mode(str)
  if @json_mode
    print(str.chars.map { |c| (0x20..0x7e).include?(c.ord) ? c : "\\u{#{"%04x" % c.ord}}" }.join(""))
  else
    print(str)
  end
end

def print_scatcode(str, domain)
  if domain != @current_domain
    print_in_mode("\u{e0001}" + domain.chars.map { |c| (0xe0000 + c.ord).chr(Encoding::UTF_8) }.join("") + "\u{e007f}")
    @current_domain = domain
  end
  print_in_mode(str)
end

if @json_mode
  print('"')
end

ARGF.each_line do |line|
  prev_type = nil
  for word in line.chomp.split(/\s+/)
    if sp = lasina_to_sp[word]
      print_scatcode(" ", "") if prev_type  == :normal
      print_scatcode(sp, "sitelenpona.gimite.net")
      prev_type = :sp
    else
      print_scatcode(" ", "") if prev_type != nil
      print_scatcode(word, "")
      prev_type = :normal
    end
  end
  print_scatcode("\n", "")
end

if @json_mode
  puts('"')
end
