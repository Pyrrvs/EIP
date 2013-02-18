class CreateResources < ActiveRecord::Migration
  def change
    create_table :resources do |t|
      t.string :name
      t.integer :project_id
      t.string :file

      t.timestamps
    end
  end
end
