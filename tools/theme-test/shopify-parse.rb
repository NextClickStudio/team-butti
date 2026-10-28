# Parses every theme .liquid file with the Ruby Liquid gem, the engine Shopify runs when a theme zip is uploaded.
# Catches what `shopify theme check` lets through, e.g. a quoted '}' inside {{ }} ("file contains Liquid templates that can't be parsed").
# Usage: gem install liquid && ruby tools/theme-test/shopify-parse.rb
require 'liquid'

class ShopifyBlock < Liquid::Block; end
class ShopifyRawBlock < Liquid::Raw; end
class ShopifyTag < Liquid::Tag; end

ENV_SHOPIFY = Liquid::Environment.build do |e|
  %w[schema style stylesheet javascript].each { |t| e.register_tag(t, ShopifyRawBlock) }
  %w[form paginate].each { |t| e.register_tag(t, ShopifyBlock) }
  %w[section sections layout content_for].each { |t| e.register_tag(t, ShopifyTag) }
end

root = File.expand_path('../..', __dir__)
files = Dir.glob(File.join(root, '{layout,sections,snippets,templates,blocks}/**/*.liquid')).sort
errors = 0
files.each do |f|
  src = File.read(f, encoding: 'UTF-8')
  %i[strict strict2].each do |mode|
    Liquid::Template.parse(src, error_mode: mode, environment: ENV_SHOPIFY, line_numbers: true)
  rescue Liquid::Error => e
    errors += 1
    puts "FAIL #{mode} #{f.delete_prefix(root + '/')}: #{e.message}"
  end
end
puts "#{files.size} file Liquid, #{errors} errori"
exit(errors.zero? ? 0 : 1)
