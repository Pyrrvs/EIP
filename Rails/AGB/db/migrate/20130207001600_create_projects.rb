class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string :name
      t.string :description
      t.string :privacy
      t.integer :nb_stars
      t.integer :user_id

      t.timestamps
    end
  end
end
