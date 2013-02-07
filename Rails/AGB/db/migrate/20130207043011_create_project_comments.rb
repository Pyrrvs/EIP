class CreateProjectComments < ActiveRecord::Migration
  def change
    create_table :project_comments do |t|
      t.string :content
      t.integer :user_id
      t.string :title
      t.integer :project_id

      t.timestamps
    end
  end
end
